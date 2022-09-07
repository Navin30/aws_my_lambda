import * as cdk from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as route53 from "@aws-cdk/aws-route53";
import * as alias from "@aws-cdk/aws-route53-targets";
import { apiStack } from './api';
import * as wafv2 from '@aws-cdk/aws-wafv2';

export class route extends apiStack {
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const ipSet = new wafv2.CfnIPSet(this, 'IPSet1', {
      addresses: ['103.16.13.205/32'],
      scope: 'CLOUDFRONT',
      ipAddressVersion: 'IPV4'
    });
  
    // Create WAFv2 Rule IP Whitelisting
    const rules: wafv2.CfnWebACL.RuleProperty[] = [];
    rules.push(
      {
        name: 'IPWhitelistRule1', // Note the PascalCase for all the properties
        priority: 1,
        action: {
          allow: {}
        },
        statement: {
          ipSetReferenceStatement: {
            arn: ipSet.attrArn
          }
        },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'ipWhitelist',
          sampledRequestsEnabled: false,
        }
      }
    );
  
    const webACL = new wafv2.CfnWebACL(this, 'WebACL', {
      defaultAction: {
        block: {},
      },
      scope: 'CLOUDFRONT',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'waf',
        sampledRequestsEnabled: false,
      },
    });
    webACL.addPropertyOverride("rules", rules);
    const siteDomain = "navintypescriptdeveops.com"
    const distribution = new cloudfront.CloudFrontWebDistribution(this, "webDistribution", {
      aliasConfiguration: {
        acmCertRef: "arn:aws:acm:us-east-1:814445629751:certificate/8f3a96b3-470e-4775-a89c-8f6d814bf3bb",
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
        names: [siteDomain],
        
      },
      
      loggingConfig: {
        bucket: new s3.Bucket(this, 'LogBucket', {
        bucketName: 'nvlambdalogbucket',
          lifecycleRules: [
              {
                enabled: true,
                expiration: cdk.Duration.days(30),
              },
            ],
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
          }),
          includeCookies: true,
        },
        
      originConfigs: [
        {
          
            customOriginSource: {
              domainName: `${this.apiGateway.restApiId}.execute-api.${this.region}.${this.urlSuffix}`,
            },
            originPath: `/${this.apiGateway.deploymentStage.stageName}`,
                  
          behaviors: [
            {
              isDefaultBehavior: true,
              allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
              
            },
          ],
        },
        {
        behaviors: [
          {
            
            allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
            pathPattern: "/hello",
          },
        ],
        customOriginSource: {
          domainName: `${this.apiGateway.restApiId}.execute-api.${this.region}.${this.urlSuffix}`,
        },
        originPath: `/${this.apiGateway.deploymentStage.stageName}`,
        
      },
      {
        behaviors: [
          {
            
            allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
            pathPattern: "/world",
          },
        ],
        customOriginSource: {
          domainName: `${this.apiGateway.restApiId}.execute-api.${this.region}.${this.urlSuffix}`,
        },
        originPath: `/${this.apiGateway.deploymentStage.stageName}`,
      }
      
      ],
      defaultRootObject: "",
      webACLId: webACL.attrArn,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      comment: "nv lambda Api" 
    });
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'ZenithWebFoundryZone', {
      hostedZoneId: 'Z0918647YP9QBSN696HQ',
      zoneName: 'navintypescriptdeveops.com.' // your zone name here
    });
    new route53.ARecord(this, 'AliasRecord', {
     zone,
     target: route53.RecordTarget.fromAlias(new alias.CloudFrontTarget(distribution)),
      
   });
    errorConfigurations:
       [
          {
            errorCode: 403,
            errorCachingMinTtl: 0,
            "responseCode": 200,
            "responsePagePath": "//cloudfronterrorbucket.s3.sa-east-1.amazonaws.com/error.html"
          },
        ]
       
       
      }
    }