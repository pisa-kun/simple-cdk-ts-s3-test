import * as cdk from 'aws-cdk-lib';
import { Template } from "aws-cdk-lib/assertions";
import { CdkTestS3Stack } from '../lib/cdk-test-s3-stack';


test("hasResource Version enabled", () => {

    const app = new cdk.App();
    const stack = new CdkTestS3Stack(app, "MyTestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::S3::Bucket", {
        VersioningConfiguration: {
            Status: "Enabled",
        },
    });
});

test("hasResource Public Access All Block", () => {

    const app = new cdk.App();
    const stack = new CdkTestS3Stack(app, "MyTestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::S3::Bucket", {
        PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true,
        },
    });
});

// test("hasResource BucketEncryption", () => {

//     const app = new cdk.App();
//     const stack = new CdkTestS3Stack(app, "MyTestStack");
//     const template = Template.fromStack(stack);

//     template.hasResourceProperties("AWS::S3::Bucket", {
//         BucketEncryption: objectLike({
//             ServerSideEncryptionConfiguration: arrayWith(
//               deepObjectLike({
//                 ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' },
//               })
//             ),
//           }),
//     });
// });