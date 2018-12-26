# node-diff-local-to-s3
Node app that takes a local filepath and s3 url and dynamically diffs the content on your cli.

## Author: Brandon Cooke

## Examples

#### Syntax 
node app -l <absolute or relative path to file> -s <s3://bucket/key>

#### Examples (NOTE these won't work, it's only for show)
node app -l /Users/brandoncookedev/helloworld.txt -s s3://testbucket/helloworld.txt
node app -l ../Documents/helloworld.txt -s s3://testbucket/helloworld.txt
