const fetch = require('node-fetch');
// id = number NFT
const getJsonNft = (id) => {
  return new Promise(async (resolve, reject) => {
    let settings = { method: "Get" };
    let url =    process.env.API_METADATA+"/"+id+".json";
    fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
      resolve(json)
    }).catch(e => {
      reject(e);
    })
  })

}

module.exports = { getJsonNft }
