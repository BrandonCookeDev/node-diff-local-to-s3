# node-diff-local-to-s3
Node app that takes a local filepath and s3 url and dynamically diffs the content on your cli.

## Author: Brandon Cooke

## Examples

#### Syntax

```
node app \ 
  -l <absolute or relative path to local file> \
  -s <s3 url [s3://bucket/key]>
```
Both command options are required.

#### Examples (NOTE these won't work, it's only for show)

```bash
# absolute path
node app -l /Users/brandoncookedev/helloworld.txt -s s3://testbucket/helloworld.txt

# relative path
node app -l ../Documents/helloworld.txt -s s3://testbucket/helloworld.txt
```
