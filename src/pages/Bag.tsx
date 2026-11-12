import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { useShop } from '../domain/store'
import { productImage } from '../data/content'
import { Action, Eyebrow, IconBtn } from '../ui/Common'
export default function Bag() {
  const bag = useShop((s) => s.bag),
    quantity = useShop((s) => s.quantity),
    remove = useShop((s) => s.removeBag)
  const count = bag.reduce((sum, i) => sum + i.qty, 0)
  return (
    <section className="wrap page-space">
      <Eyebrow>DEMO BAG</Eyebrow>
      <h1 className="display page-title">
        My <em>bag.</em>
        <sup>{count}</sup>
      </h1>
      {!bag.length ? (
        <div className="empty-bag">
          <img src={productImage('origin')} alt="Bone-white Court 01 in the Origin colorway" />
          <div>
            <h2>Your bag is empty.</h2>
            <p>Design your first pair in the studio, then add it to your demo bag.</p>
            <Action to="/customize">BUILD YOUR FIRST PAIR</Action>
          </div>
        </div>
      ) : (
        <div className="bag-layout">
          <div>
            {bag.map((item) => {
              const c = item.config
              return (
                <article className="bag-item" key={item.id}>
                  <img
                    src={item.preview || productImage(c.colorway)}
                    alt={c.sideText || c.colorway + ' sneaker preview'}
                  />
                  <div className="bag-details">
                    <p className="overline">COURT 01 / {c.colorway.toUpperCase()}</p>
                    <h2>{c.sideText || 'IDC COURT 01'}</h2>
                    <p>
                      EU {c.size} · {c.laceType.toUpperCase()} laces ·{' '}
                      {c.advanced ? c.craft.toUpperCase() : 'Standard customization'}
                    </p>
                    <p>
                      Graphic: {c.graphic.toUpperCase()} · {c.placement.toUpperCase()}
                    </p>
                    <small>CONFIG / {item.id.slice(0, 8).toUpperCase()}</small>
                    <div className="bag-controls">
                      <div className="quantity">
                        <IconBtn
                          label="Decrease quantity"
                          disabled={item.qty === 1}
                          onClick={() => quantity(item.id, -1)}
                        >
                          <Minus size={14} />
                        </IconBtn>
                        <span>{item.qty}</span>
                        <IconBtn
                          label="Increase quantity"
                          disabled={item.qty === 99}
                          onClick={() => quantity(item.id, 1)}
                        >
                          <Plus size={14} />
                        </IconBtn>
                      </div>
                      <Link className="text-link" to={'/customize?edit=' + item.id}>
                        Edit design <ArrowRight size={14} />
                      </Link>
                      <IconBtn label="Remove item" onClick={() => remove(item.id)}>
                        <Trash2 size={16} />
                      </IconBtn>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <aside className="bag-summary">
            <p className="overline">OVERVIEW</p>
            <h2>Bag summary</h2>
            <div>
              <span>Items</span>
              <b>{count}</b>
            </div>
            <div>
              <span>Price</span>
              <b>To be confirmed</b>
            </div>
            <p>
              This bag is for the concept demo. Your designs are saved in this browser, and you can
              return to the studio to edit them at any time.
            </p>
            <Action to="/collection" secondary>
              CONTINUE EXPLORING
            </Action>
          </aside>
        </div>
      )}
    </section>
  )
}
