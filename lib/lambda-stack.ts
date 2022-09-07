import * as cdk from '@aws-cdk/core';

import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import * as iam from '@aws-cdk/aws-iam';


export class LambdaStack extends cdk.Stack {
  apiDefaultHandler :any
  apiHelloGetHandler :any
  apiWorldGetHandler :any
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const webserverRole = new iam.Role(this, 'webserver-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
    });
     this.apiDefaultHandler =  new lambda.Function(
      this,
      "apiDefaultHandler",
      {
        runtime: lambda.Runtime.PYTHON_3_9,
        role:webserverRole,
        code: lambda.Code.fromAsset(path.join(__dirname,'../hello/')),
        handler: "default.handler",
        memorySize: 1024
        
      }
    );
    this.apiHelloGetHandler =  new lambda.Function(
      this,
      "apiHelloGetHandler",
      {
        runtime: lambda.Runtime.PYTHON_3_9,
        role:webserverRole,
        code: lambda.Code.fromAsset(path.join(__dirname,'../hello/')),
        handler: "hello.handler",
        memorySize: 1024
        
      }
    );
    this. apiWorldGetHandler =  new lambda.Function(
      this,
      "apiWorldGetHandler",
      {
        runtime: lambda.Runtime.PYTHON_3_9,
        role:webserverRole,
        code: lambda.Code.fromAsset(path.join(__dirname,'../hello/')),
        handler: "world.handler",
        memorySize: 1024
        
      }
    );
}
}
  