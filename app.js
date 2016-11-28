const db = []

const getCustomer = (customerId) => {
  return fetch(`customer${customerId}/transactions.csv`).then(res => {
    return res.text()

  }).then(data => {
    return data.split('\n')

  }).then(rows => {
    const titles = rows[0].replace(/\"/g, '').split(',')

    return [titles, rows.slice(1).reduce((list, row) => {
      list.push(row.replace(/\"/g, '').split(','))
      return list
    }, [])]

  }).then(([titles, transactions]) => {
    return [titles, [...transactions].map(transaction => {
      return [...transaction].map(item => {
        return String(parseFloat(item)) === item ? parseFloat(item) : item
      })
    })]

  }).then(([titles, transactions]) => {
    return [...transactions].map(transaction => {
      const t = transaction.reduce((obj, item, index) => {
        obj[titles[index]] = item
        return obj
      }, {})
      t["customerId"] = customerId

      return t
    })
  })
}

document.addEventListener('DOMContentLoaded', ev => {
  Promise.all(Array.from(new Array(10)).map((item, index) => {
    return getCustomer(index)
  })).then(val => {
    return val.reduce((list, val) => list.concat(val), [])
  }).then(all => {
    generate(all, 1714339159)
    generate(all, 2763512073)
    generate(all, 7175177661)
    generate(all, 6805794923)
    generate(all, 5463650946)

    generate(all, 4791486375)
    generate(all, 9526439009)
    generate(all, 7723109118)
    generate(all, 4538439729)
    generate(all, 9152783315)
  })
})

const generate = (data, acc) => {
  // most popular outgoings
  // surprisingly boring
  //
  // const popouts = Object.entries(data.reduce((trs, tr) => {
  //   if (tr.description in trs) trs[tr.description] += 1
  //   else trs[tr.description] = 1
  //   return trs
  // }, {}))
  //
  // console.log(popouts.sort((a, b) => b[1] - a[1]))

  const ctx = document.querySelector('canvas').getContext('2d')

  const w = ctx.canvas.width = window.innerWidth
  const h = ctx.canvas.height = window.innerHeight

  ctx.clearRect(0, 0, 10000, 10000)
  ctx.fillRect(0, 0, 10000, 10000)

  // ctx.beginPath()
  // ctx.moveTo(0, h / 2)
  // ctx.lineTo(w, h / 2)
  // ctx.closePath()
  // ctx.strokeStyle = 'white'
  // ctx.stroke()

  ctx.lineWidth = 2
  ctx.globalCompositeOperation = 'lighter'

  data = data
    .filter(tr => tr.account === acc)
    .sort((a, b) => {
      return a.date - b.date
    })

  const income = data.filter(tr => tr.amount > 0)
  const outgoings = data.filter(tr => tr.amount < 0)

  const earliest = data.reduce((min, dp) => {
    return min < dp.date ? min : dp.date
  }, Infinity)

  const latest = data.reduce((max, dp) => {
    return max > dp.date ? max : dp.date
  }, 0)

  const scale = 25
  const radius = 100
  const prime = 13

  let px = -Infinity;
  let po = -Infinity;
  let pt = income[0].date;

  income.forEach((dp, index) => {
    let amount = dp.amount

    if (dp.amount < 0) amount = -Math.pow(Math.abs(dp.amount), 0.3)
    else if (dp.amount == 0) amount = 0
    else amount = Math.pow(dp.amount, 0.3)

    let x = normalize(dp.date, earliest, latest, 0, Math.PI * prime)
    let offset = radius + amount * scale

    ;(function (ctx, w, h, x, px, po, offset, index) {
      setTimeout(function () {
        ctx.beginPath()

        ctx.moveTo(w / 2 + Math.cos(px) * po, h / 2 + Math.sin(px) * po)
        ctx.lineTo(w / 2 + Math.cos(x) * offset, h / 2 + Math.sin(x) * offset)

        ctx.strokeStyle = 'rgba(30, 255, 0, 0.8)'
        ctx.stroke()
      }, index * 40)
    })(ctx, w, h, x, px, po, offset, index)

    px = x
    po = offset
    pt = dp.date

  })

  outgoings.forEach((dp, index) => {
    let amount = dp.amount

    if (dp.amount < 0) amount = Math.pow(Math.abs(dp.amount), 0.3)
    else if (dp.amount == 0) amount = 0
    else amount = Math.pow(dp.amount, 0.3)

    let x = normalize(dp.date, earliest, latest, 0, Math.PI * prime)
    let offset = radius + amount * scale

    ;(function (ctx, w, h, x, px, po, offset, index) {
      setTimeout(function () {
        ctx.beginPath()

        ctx.moveTo(w / 2 + Math.cos(px) * po, h / 2 + Math.sin(px) * po)
        ctx.lineTo(w / 2 + Math.cos(x) * offset, h / 2 + Math.sin(x) * offset)

        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'
        ctx.stroke()
      }, index * 12)
    })(ctx, w, h, x, px, po, offset, index)

    px = x
    po = offset
    pt = dp.date
  })

  let balance = 0
  data.forEach((dp, index) => {
    balance += dp.amount
    let amount = balance

    if (amount < 0) amount = -Math.pow(Math.abs(amount), 0.3)
    else if (amount == 0) amount = 0
    else amount = Math.pow(amount, 0.3)

    let x = normalize(dp.date, earliest, latest, 0, Math.PI * prime)
    let offset = Math.max(radius + amount * scale, radius)

    ;(function (ctx, w, h, x, px, po, offset, index) {
      setTimeout(function () {
        ctx.beginPath()

        ctx.moveTo(w / 2 + Math.cos(px) * po, h / 2 + Math.sin(px) * po)
        ctx.lineTo(w / 2 + Math.cos(x) * offset, h / 2 + Math.sin(x) * offset)

        ctx.strokeStyle = 'rgba(0, 120, 255, 0.9)'
        ctx.stroke()
      }, index * 10)
    })(ctx, w, h, x, px, po, offset, index)

    px = x
    po = offset
    pt = dp.date
  })

  // console.log(balance)
}

const normalize = (n, x, y, u, v) => {
  const normal = (n - x) / (y - x)
  return u + (normal * (v - u))
}
