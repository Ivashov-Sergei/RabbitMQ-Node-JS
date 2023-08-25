#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

async function rmqPub(appMsg, action) {
    var args = process.argv.slice(2);
    // const id = appMsg.id;
    // const name = appMsg.name;
    // const age = appMsg.age;
    // const myMsg = 'User: id = ' + id + " name = " + name + " age = " + age + " action = " + action;


    if (args.length === 0) {
        console.log("Usage: rpc_client.js num        args.length === 0");
        //process.exit(1);
    }

    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertQueue('', {
                exclusive: true
            }, function (error2, q) {
                if (error2) {
                    throw error2;
                }

                var correlationId = generateUuid();
                var num = parseInt(args[0]);
                num = appMsg.age;

                channel.consume(q.queue, function (msg) {
                    if (msg.properties.correlationId === correlationId) {
                        console.log("Тут КЛИЕНТ принял запрос с рабита ")
                        console.log("локальный num  ==  " + num)

                        console.log('Значение num, что мы получили с сервера', msg.content.toString());
                        setTimeout(function () {
                            connection.close();
                            //  process.exit(0);
                        }, 500);
                    }
                }, {
                    noAck: true
                });
                console.log("Тут запрос улетел в рабит с КЛИЕНТА   num ==  " + num)
                channel.sendToQueue('rpc_queue',
                    Buffer.from(num.toString()), {
                    correlationId: correlationId,
                    replyTo: q.queue
                });
            });
        });
    });
};

module.exports = {
    rmqPub: rmqPub
};

function generateUuid() {
    console.log("use generateUuid");
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}