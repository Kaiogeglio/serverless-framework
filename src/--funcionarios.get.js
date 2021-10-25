const Joi = require('@hapi/joi')
const decoratorValidator = require('./util/decoratorValidator')
const globalEnum = require('./util/globalEnum')

class Handler {

    constructor({ dynamoDbSvc }) {
        this.dynamoDbSvc = dynamoDbSvc
        this.dynamodbTable = process.env.DYNAMODB_TABLE
    }

    static validator() {
        return Joi.object({
            id: Joi.string().required(),
        })
    }

    async getItem(params) {
        return this.dynamoDbSvc.query(params).promise()
    }

    prepareData(data) {
        const params = {
            TableName: this.dynamodbTable,
            KeyConditionExpression: '#id = :id',
            ExpressionAttributeNames: {
                "#id":"id"
            },
            ExpressionAttributeValues: {
                ':id': data.id
            }
        }
        return params
    }

    handlerSuccess(data) {
        const response = {
            statusCode: 200,
            body: JSON.stringify(data)
        }
        return response
    }

    handleError(data) {
        return {
            statusCode: data.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t create item!!'
        }
    }
    async main(event) {
        console.log(event)
        try {
            // agora o decorator modifica o body e já
            // retorna no formato JSON
            const data = event;
            

 
            const dbParams = this.prepareData(data)
            const response = await this.getItem(dbParams)
            return this.handlerSuccess(response)
        } catch (error) {
            console.error('Deu ruim**', error.stack)
            return this.handleError({ statusCode: 500 })
        }
    }
}
//factory
const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const handler = new Handler({
    dynamoDbSvc: dynamoDB
})
module.exports = decoratorValidator(
    handler.main.bind(handler),
    Handler.validator(),
    globalEnum.ARG_TYPE.QUERYSTRING)