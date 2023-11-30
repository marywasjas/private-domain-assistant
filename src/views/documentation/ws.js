const Websocket = require('ws')

const wss = new Websocket.Server({ port: 3000 })

wss.on(
  'connection',
  (ws) => {
    ws.on(
      'message',
      (message) => { 
        console.log('server receive message: ', message.toString())
        ws.send('Message received by server: ' + message.toString())
      })

    // ws.send('msg from server!')
  }
)

console.log('WebSocket server started on port 3000')
