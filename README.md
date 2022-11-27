# aws cdk s3 deploy and cdk test

S3バケットの作成とスクリプトのテストまで

TDDのように先にテストコードを記載して、実設定のコードを作っていくことが可能

## start

> cdk init --language typescript

> npm install --save-dev @aws-cdk/aws-s3

### aws cdk v2 でのs3 init

```ts
    new cdk.aws_s3.Bucket(this, bucketName ,{
      versioned: true,
      bucketName: bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
    });

```

## 参考にするコード

[AWS CDK v2 化マイグレーション目録 〜バージョンアップのウォッチから裏付け検証まで〜](https://engineering.dena.com/blog/2022/02/aws-cdk-v2/)

## CDKのテストについて

[AWS CDKにおける基本的なテストと実装方法を調べて試した](https://dev.classmethod.jp/articles/aws-cdk-testing/)

### Snapshot tests（golden master test）
CDKライブラリが生成するCloudFormationテンプレートと前に生成されたテンプレートが同じであるかをテストします。

### Fine-grained tests(Fine-grained assertions about the template)
機能単位での詳細なテストを行うのがFine-grained assertionsになります。
AWS CDKでは@aws-cdk/assert/jestでJestのCustom Matcherを提供しています。
これが提供するtoHaveResourceを使用することでCDK StackがCloudFormationリソースを保持しているかをテストできます。

### Validation tests
Constructに対して無効な値を渡した時に正しくエラーが発生することと有効な値を渡した時に問題が起きないかを確認

## コンストラクタテスト

CDK デベロッパーガイド には、コンストラクトのテストについてのガイドがあります。 このワークショップのセクションでは きめ細かな(fine-grained) アサーション と 検証(validation) の種類のテストを利用します。

- [アサーションテスト](https://cdkworkshop.com/ja/20-typescript/70-advanced-topics/100-construct-testing/1000-assertion-test.html)

```ts
// hitcounter.test.ts
import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter }  from '../lib/hitcounter';

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream:  new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });
  // THEN

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});
```

- [バリデーションテスト](https://cdkworkshop.com/ja/20-typescript/70-advanced-topics/100-construct-testing/2000-validation-tests.html)

```ts
export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error('readCapacity must be greater than 5 and less than 20');
    }

    super(scope, id);
    // ...
  }
}
```

```ts
// test.ts
test('read capacity can be configured', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream:  new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hello.handler',
        code: lambda.Code.fromAsset('lambda')
      }),
      readCapacity: 3
    });
  }).toThrowError(/readCapacity must be greater than 5 and less than 20/);
});
```