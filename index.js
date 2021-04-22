require('dotenv').config()
const { WebhookClient, MessageEmbed } = require('discord.js')
const axios = require('axios')
const express = require('express')
const app = express()

const PORT = process.env.PORT || 5000

const HOOK_ID = process.env.HOOK_ID
const HOOK_TOKEN = process.env.HOOK_TOKEN
const hook = new WebhookClient(HOOK_ID, HOOK_TOKEN)

const VK = process.env.VK
const GROUP_ID = process.env.GROUP_ID

process.on('unhandledRejection', function(err) {
  console.log(err)
})

app.get('/', (req, res) => {
  res.end('<h1>Hello from BuddyBot!</h1>')
})

app.listen(PORT, () => {
  console.log(`Server has been started on port ${PORT}...`)
})

axios.get(`https://api.vk.com/method/groups.getLongPollServer?group_id=${GROUP_ID}&access_token=${VK}&v=5.130`)
  .then(res => {
    const key = res.data.response.key
    const server = res.data.response.server
    const ts = res.data.response.ts

    let long_poll = `${server}?act=a_check&key=${key}&ts=${ts}$wait=25`

    const getInfo = () => axios.get(long_poll)
      .then(res => {
        console.log(res.data)

        const info = res.data.updates

        info.forEach(element => {
          if (element.type === 'wall_post_new') {

            const text = element.object.text
            const media = []
            const attachments = element.object.attachments
            if (attachments) {
              attachments.forEach(element => {
                if (element.type === 'photo') {
                  const sizes = element.photo.sizes
                  let preview = sizes.find(s => s.type === 'w')
                  if (preview) media.push(preview.url)
                  else {
                    preview = sizes.find(s => s.type === 'z')
                    if (preview) media.push(preview.url)
                    else {
                      preview = sizes.find(s => s.type === 'y')
                      if (preview) media.push(preview.url)
                      else {
                        preview = sizes.find(s => s.type === 'x')
                        if (preview) media.push(preview.url)
                        else {
                          preview = sizes.find(s => s.type === 'm')
                          if (preview) media.push(preview.url)
                          else {
                            media.push(sizes[0].url)
                          }
                        }
                      }
                    }
                  }
                }
              })
            }

            if (text) {
              const embed = new MessageEmbed()
              .setTitle('FABLAB ВГУЭС | Цифровая лаборатория')
              .setDescription(text)
              .setColor('ORANGE')
              .setURL(`https://vk.com/club${GROUP_ID}`)

              hook.send(embed)
            }

            media.forEach(m => {
              const newEmbed = new MessageEmbed()
                .setColor('ORANGE')
                .setURL(`https://vk.com/club${GROUP_ID}`)
                .setImage(m)
              
              hook.send(newEmbed)
            })
          }
        })

        long_poll = `${server}?act=a_check&key=${key}&ts=${res.data.ts}$wait=25`
      })
      .catch(error => {
        console.error(error)
      })

    setInterval(getInfo, 25000)
  })
  .catch(error => {
    console.error(error)
  })
