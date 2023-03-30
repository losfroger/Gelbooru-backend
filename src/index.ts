import express, { Express, Request, Response } from 'express'
import cors from 'cors'

import axios from 'axios'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'

import dotenv from 'dotenv'

import { GelbooruPost, GelbooruTag } from 'gelbooru'

import he from 'he'

dotenv.config()

const app = express()

app.use(cors())

const port = process.env.PORT || 5000
const base_gelbooru_url = process.env.BASE_URL

const axios_gelbooru = axios.create({
  baseURL: base_gelbooru_url
})

// Dummy url
app.post('/login', (req, res) => {
  res.send('Logged in!')
})

app.use((req, res, next) => {
  if (req.headers.api_key && req.headers.user_id) {
    console.log('middleware!')
    next()
    return
  }

  res.status(StatusCodes.BAD_REQUEST).send('No api key or user id found')
})

const videoTags = ['animated', 'video']
app.get('/post', async (req, res) => {
  try {
    const resGel = await axios_gelbooru.get('', {
      params: {
        page: 'dapi',
        q: 'index',
        s: 'post',
        json: 1,
        limit: 25,
        api_key: req.headers.api_key,
        user_id: req.headers.user_id,
        pid: req.query.pid,
        tags: req.query.tags,
      }
    })

    resGel.data.post.forEach((post: GelbooruPost) => {
      post.created_at_date = new Date(post.created_at)

      post.tags_array = he.decode(post.tags).split(' ')
      post.source_array = post.source.split('|').map((src) => src.trim())

      post.has_note_bool = post.has_notes === 'true'
      post.has_comments_bool = post.has_comments === 'true'
      post.has_children_bool = post.has_children === 'true'

      post.is_video = post.tags_array.some((tag) => videoTags.includes(tag))
      post.is_3d = post.tags_array.includes('3d')
      post.is_irl = post.tags_array.includes('photo_(medium)')
    })

    res.send(resGel.data)
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST)
  }
})

app.get('/tag', async (req, res) => {
  try {
    const resGel = await axios_gelbooru.get('', {
      params: {
        page: 'dapi',
        q: 'index',
        s: 'tag',
        limit: 10,
        json: 1,
        api_key: req.headers.api_key,
        user_id: req.headers.user_id,
        name_pattern: req.query.name_pattern,
        name: req.query.name,
        orderby: req.query.orderby ?? 'count'
      }
    })

    resGel.data.tag.forEach((tag: GelbooruTag) => {

      switch (tag.type) {
        case 0:
          tag.type_string = 'general'
          break
        case 1:
          tag.type_string = 'artist'
          break
        case 3:
          tag.type_string = 'copyright'
          break
        case 4:
          tag.type_string = 'character'
          break
        case 5:
          tag.type_string = 'metadata'
          break
        case 6:
          tag.type_string = 'deprecated'
          break
        default:
          tag.type_string = 'not identified'
          break
      }



    })

    res.send(resGel.data)
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST)
  }
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})