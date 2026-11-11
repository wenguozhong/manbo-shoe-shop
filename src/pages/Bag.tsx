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
          <img src={productImage('origin')} alt="骨白色 COURT 01 基础鞋款" />
          <div>
            <h2>第一双，从这里开始。</h2>
            <p>在工作室完成设计，再把它放入你的演示购物袋。</p>
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
                    alt={c.sideText || c.colorway + ' 球鞋预览'}
                  />
                  <div className="bag-details">
                    <p className="overline">COURT 01 / {c.colorway.toUpperCase()}</p>
                    <h2>{c.sideText || 'IDC COURT 01'}</h2>
                    <p>
                      EU {c.size} · {c.laceType.toUpperCase()} 鞋带 ·{' '}
                      {c.advanced ? c.craft.toUpperCase() : '标准 DIY'}
                    </p>
                    <p>
                      图案 {c.graphic.toUpperCase()} · {c.placement.toUpperCase()}
                    </p>
                    <small>CONFIG / {item.id.slice(0, 8).toUpperCase()}</small>
                    <div className="bag-controls">
                      <div className="quantity">
                        <IconBtn
                          label="减少数量"
                          disabled={item.qty === 1}
                          onClick={() => quantity(item.id, -1)}
                        >
                          <Minus size={14} />
                        </IconBtn>
                        <span>{item.qty}</span>
                        <IconBtn
                          label="增加数量"
                          disabled={item.qty === 99}
                          onClick={() => quantity(item.id, 1)}
                        >
                          <Plus size={14} />
                        </IconBtn>
                      </div>
                      <Link className="text-link" to={'/customize?edit=' + item.id}>
                        编辑方案 <ArrowRight size={14} />
                      </Link>
                      <IconBtn label="移除商品" onClick={() => remove(item.id)}>
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
            <h2>购物袋总览</h2>
            <div>
              <span>件数</span>
              <b>{count}</b>
            </div>
            <div>
              <span>价格</span>
              <b>待定</b>
            </div>
            <p>演示项目，未开放交易。方案保存在此浏览器，可随时返回工作室调整。</p>
            <Action to="/collection" secondary>
              CONTINUE EXPLORING
            </Action>
          </aside>
        </div>
      )}
    </section>
  )
}
