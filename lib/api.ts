import * as cdk from '@aws-cdk/core';
import {LambdaStack} from "../lib/lambda-stack";
import { LogGroup } from "@aws-cdk/aws-logs";
import * as apigw from "@aws-cdk/aws-apigateway";

export class apiStack extends LambdaStack {
  apiGateway :any
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
      
      const nvApiLog = new LogGroup(this, "nvApiLog");
      
      this.apiGateway = new apigw.LambdaRestApi(this, "apiGateway", {
        handler:this.apiDefaultHandler,
        endpointConfiguration: {
          types: [apigw.EndpointType.REGIONAL]
        },
        defaultMethodOptions: {
          authorizationType: apigw.AuthorizationType.NONE
        },
        proxy: false,
        deployOptions: {
          accessLogDestination: new apigw.LogGroupLogDestination(nvApiLog),
          accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields(),
          loggingLevel: apigw.MethodLoggingLevel.INFO,
          metricsEnabled: true,
        },
      })
      this.apiGateway.root.addMethod('ANY');

      const apiHelloRoute = this.apiGateway.root.addResource("hello")
      // GET
      apiHelloRoute.addMethod(
        "GET",
          new apigw.LambdaIntegration(this.apiHelloGetHandler)
      );
      apiHelloRoute.addMethod(
        "POST",
        new apigw.LambdaIntegration(this.apiHelloGetHandler)
      )
  
      
      // /api/world
      const apiWorldRoute = this.apiGateway.root.addResource("world")
      // GET
      apiWorldRoute.addMethod(
        "GET",
        new apigw.LambdaIntegration(this.apiWorldGetHandler)
      );
      apiWorldRoute.addMethod(
        "POST",
        new apigw.LambdaIntegration(this.apiWorldGetHandler)
      )
    }
  }