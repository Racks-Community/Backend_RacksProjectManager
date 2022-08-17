const fetch = require('node-fetch');
const {  getJsonNft } = require('./getJsonNft')

const getEnablesNftFilter = (nftsList, TicketsList, TypeFilter = null) => {
  return new Promise((resolve, reject) => {
    let nftsArray = [];
    let totalNfts = nftsList.length;
    let conteoNft = 0;
    let nft_data = [];
    let valueFilterNft = false;
    console.log('TypeFilter', TypeFilter)
    nftsList.forEach(async (element) => {
      await getJsonNft(element).then(re => {
        nft_data = re;
        //validate filter discount
        if(TypeFilter) {
          nft_data.attributes.find(function(value) {
              if(value.trait_type == TypeFilter) {
                if(TypeFilter ==  'Headwear')  {
                  valueFilterNft =  ['BTC Black Cap', 'BTC White Cap', 'McHodler Red Cap', 'McHodler Black Cap' ].includes(value.value);
                }
                if(TypeFilter ==  'Eyes')  {
                  valueFilterNft =  ['Wall Street'].includes(value.value);
                }
              }
          })
        }
        conteoNft ++;
      }).catch(err => {
        conteoNft ++;
      }); // get nfts details
      let statusNft = 'enabled'; 
      let data_ticket = []; 
      await TicketsList.forEach(e => {
          if(e.number_nft == element) {
            data_ticket = e;
            statusNft = 'used';
          }    
      });
      nftsArray.push({
          number: parseInt(element),
          status: statusNft,
          data_ticket,
          nft_data,
          valueFilterNft 
      });
      if(totalNfts === conteoNft) {
        resolve(nftsArray)
      }
    });
  })
}

module.exports = { getEnablesNftFilter }
