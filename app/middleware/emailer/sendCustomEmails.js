const i18n = require('i18n')
const { prepareToSendEmail } = require('./prepareToSendEmail')
const fs = require('fs')

/**
 * Sends registration email
 * @param {string} locale - locale
 * @param {Object} user - user object
 */

// orden completada por el influencer
const orderComplete = async (user = {}, order, codeDest = {}) => {
  let type_ticket = order.type
  let redemption_link = order.redemption_link
  i18n.setLocale('es')
  const subject = i18n.__('custom.ORDENSEND')
  if (type_ticket == 'code_multiple_event') {
    if (codeDest.length) {
      const htmlMessage = await parseHtml('order_ticket_code.html', {
        nft_number: order.number_nft,
        nft_image: order.nft_data.image,
        name: user.name,
        lastname: user.lastname,
        link_page: redemption_link ? order.event_data.redemption_link : '',
        code_decount: codeDest[0].code,
        _id: order.event_data._id
      })
      prepareToSendEmail(user, subject, htmlMessage)
    }
  } else if (type_ticket == 'register_classic_email') {
    const htmlMessage = await parseHtml('order_ticket_email.html', {
      nft_number: order.number_nft,
      nft_image: order.nft_data.image,
      name_event: order.event_data.name,
      name: user.name,
      lastname: user.lastname,
      name_project: null,
      link_page: redemption_link ? order.event_data.redemption_link : '',
      _id: order.event_data._id
    })
    prepareToSendEmail(user, subject, htmlMessage)
  }
}

const parseHtml = (template, order) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      `${__dirname}/../../../template/${template}`,
      'utf8',
      (err, data) => {
        if (err) {
          reject(err)
          return
        }
        if (order.nft_number) {
          data = data.replace(/NUMBER_NFT/g, order.nft_number)
        }
        if (order.nft_image) {
          data = data.replace(/IMAGE_NFT/g, order.nft_image)
        }
        if (order.lastname) {
          data = data.replace(/LASTNAME_USER/g, order.lastname)
        }
        if (order.name) {
          data = data.replace(/NAME_USER/g, order.name)
        }
        if (order.link_page) {
          data = data.replace(/LINK_PAGE/g, order.link_page)
        }
        if (order.code_decount) {
          data = data.replace(/CODE_DESCOUNT/g, order.code_decount)
        }
        if (order._id) {
          data = data.replace(/TOKEN_USER/g, `${order._id}`)
        }
        if (order.name_event) {
          data = data.replace(/NAME_EVENT/g, `${order.name_event}`)
        }
        if (order.name_project) {
          data = data.replace(/PROJECT/g, `${order.name_project}`)
        }

        data = data.replace(/API_URL/g, `${process.env.API_URL}`)
        resolve(data)
      }
    )
  })
}

module.exports = { orderComplete }
