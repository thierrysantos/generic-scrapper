import { execute, Page } from './scrapper'

(async () => {
  const page: Page = {
    link: 'https://calculadoradosono.com/',
    pageName: 'Home',
    search: {
      'title': {
        selector: 'body',
        find: "main > h2",
        parseTo: 'string'
      }
    }
  }

  try {
    const [ weekLongDeals ] = await execute([page])
  } catch (error) {
    console.error({ 
      message: error.message, 
      stack: error.stack 
    })    
  }

})()