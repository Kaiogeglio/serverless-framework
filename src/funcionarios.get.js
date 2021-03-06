const uuid = require('uuid')
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
            id: Joi.string(),
        })
    }

    async getItem(params) {
        return this.dynamoDbSvc.query(params).promise()
    }

    prepareData(id) {
        const params = {
            TableName: this.dynamodbTable,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': 'f23dc700-3530-11ec-ac6c-e74a90fc0553'
            },
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
        
        return this.handlerSuccess(event)
        // try {
        //     // retorna no formato JSON
        //     const { id } = event.pathParameters;
 
        //     const dbParams = this.prepareData(id)
            
        //     const response = await this.getItem(dbParams)
        //     return this.handlerSuccess(response)
        // } catch (error) {
        //     console.error('Deu ruim**', error.stack)
        //     return this.handleError({ statusCode: 500 })
        // }
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
    globalEnum.ARG_TYPE.PATH)