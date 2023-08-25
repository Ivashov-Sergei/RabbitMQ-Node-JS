#!/usr/bin/env node

var amqp = require('amqplib/callback_api');



amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        //подписываемся на очередь queue
        var queue = 'rpc_queue';
        channel.assertQueue(queue, {
            durable: false
        });

        channel.prefetch(1);
        console.log(' [x] Awaiting RPC requests');

        channel.consume(queue, function reply(msg) {
            console.log("тут СЕРВЕР принял запрос с рабита")
            var num = parseInt(msg.content.toString());
            var r = plusFive(num);

            // отправляем ответ в очередь из поля replyTo
            // помещаем ответ в поле correlationId
            console.log("тут запрос улетел в рабит с СЕРВЕРА")
            channel.sendToQueue(msg.properties.replyTo,
                Buffer.from(r.toString()), {
                correlationId: msg.properties.correlationId
            });

            channel.ack(msg);
        });
    });
});



function plusFive(num) {
    num = num + 5;
    console.log("START num = num + 5   ==  " + num)
    return num;
}