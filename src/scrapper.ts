import cheerio from 'cheerio'
import { values } from 'ramda'
import axios from 'axios'

type formatParse = (data: string | Date | number ) => string | Date | number

interface Search {
  selector: string
  find: string
  parseTo: 'number' | 'date' | 'string'
  formatAfterParse?: formatParse
  formatBeforeParse?: formatParse
  data?: string | Date | number
}

export interface Page {
  pageName: string
  link: string
  way?: 'puppeter' | 'axios'
  search: Record<string, Search>
}

const parserMapper: Record<'number' | 'date' | 'string', formatParse> = {
  number: (value) => Number(value),
  date: (value) => new Date(value),
  string: (value) => value
}

export const getDataWithSelector = (
  $: cheerio.Root, 
  search: Search
): Search => {
  let data: string | Date | number = $(search.selector)
                                      .find(search.find)
                                      .text()
                                      .trim()

  if(search.formatBeforeParse) {
    data = search.formatBeforeParse(data)
  }

  if(search.parseTo) {
    const parseFunction = parserMapper[search.parseTo]
    data = parseFunction(data)
  }

  if(search.formatAfterParse) {
    data = search.formatAfterParse(data)
  }

  return {
    ...search,
    data,
  }
}

export const execute = (pages: Page[]): Promise<Page[]> => {
  return Promise.all(
    pages.map(async ({ way = 'axios', ...page }) => {
      let html: cheerio.Root

      if(way === 'axios') {
        const response = await axios.get(page.link)
        html = cheerio.load(response.data)
      } else {
        html = cheerio.load('')
      }
      
      const searchReduce =  Object.entries(page.search).reduce(
        (acc, [item, search]) => {
          return {
            ...acc, 
            [item]: getDataWithSelector(html, search)
          }
        }, 
        {}
      )

      return {
        ...page,
        search: searchReduce,
      }
    })
  )
}