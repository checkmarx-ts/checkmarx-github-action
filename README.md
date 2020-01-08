# Checkmarx Github Action ![Checkmarx](images/checkmarx.png) <img src="images/github.png" alt="Github" width="40" height="40">

[![Tests](https://github.com/miguelfreitas93/checkmarx-github-action/workflows/Checkmarx%20Github%20Action/badge.svg)](https://github.com/miguelfreitas93/checkmarx-github-action/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Find security vulnerabilities in your Github Repository with Checkmarx using Github Action Integration.

![Checkmarx](images/checkmarx-big.png)

Checkmarx SAST (CxSAST) is an enterprise-grade flexible and accurate static analysis solution used to identify hundreds of security vulnerabilities in custom code. It is used by development, DevOps, and security teams to scan source code early in the SDLC, identify vulnerabilities and provide actionable insights to remediate them. Supporting over 22 coding and scripting languages and their frameworks with zero configuration to scan any language.

Please find more info in the official website: <a href="www.checkmarx.com">Checkmarx.com</a>

## Inputs

For using this action, there is a set of options that can be used, such as:

| Variable  | Value (Example) | Description | Type | Is Required* | Default |
| ------------- | ------------- | ------------- |------------- | ------------- | ------------- |
| cxAction | Scan | Checkmarx CLI Action - One of the following: Scan, AsyncScan, OsaScan, AsyncOsaScan, GenerateToken, RevokeToken | String | No | Scan |

#### Inputs for Actions: Scan, AsyncScan 
| Variable  | Value (Example) | Description | Type | Is Required* | Default |
| ------------- | ------------- | ------------- |------------- | ------------- | ------------- |
| cxServer | https://checkmarx.company.com | Checkmarx Server URL | String | Yes* |
| cxUsername | admin@cx | Checkmarx Username | String | Yes* (if no token) |
| cxPassword | ${{ secrets.CX_PASSWORD }} | Checkmarx Password | Secure String | Yes* (if no token) |
| cxToken | ${{ secrets.CX_TOKEN }} | Checkmarx Token | Secure String | Yes* (if no credentials)|
| cxTeam | \CxServer\SP\Company\TeamA | Checkmarx Team | String | Yes* |
| cxPreset | Checkmarx Default | Checkmarx Project Preset | String | No | Checkmarx Default |
| cxConfiguration | Default Configuration | Project Configuration | String | No | Default Configuration |
| cxExcludeFolders | node_modules,test* | Exclude Folders | String | No | |
| cxExcludeFiles | *.spec.js, *.sql | Exclude Files | String | No | |
| cxHigh | 0 | Threshold for High Severity Vulnerabilities | Integer | No | -1 |
| cxMedium | 0 | Threshold for Medium Severity Vulnerabilities| Integer | No | -1 |
| cxLow | 0 | Threshold for Low Severity Vulnerabilities| Integer | No | -1 |
| cxReportXML | reports/sast.xml  | Generate CxSAST XML report. | String | No | |
| cxReportPDF | reports/sast.pdf  | Generate CxSAST PDF report. | String | No | |
| cxReportRTF | reports/sast.rtf  | Generate CxSAST RTF report. | String | No | |
| cxReportCSV | reports/sast.csv  | Generate CxSAST CSV report. | String | No | |
| cxForceScan | false | Force Scan | Boolean | No | false |
| cxIncremental | false | Incremental Scan | Boolean | No | false |
| cxPrivate | false | Private Scan | Boolean | No | false |
| cxLog | log.log | Log File CLI output | String | No | | 
| cxComment | Test Scan Comment | Scan Comment | String | No | git branch@commitSHA |
| cxVerbose | true | Checkmarx CLI log verbose level | Boolean | No | true |
| cxVersion | 8.9 | Checkmarx CLI version : 8.9, 8.8, 8.7, 8.6 | String | No | 8.9 |

#### Inputs for Actions: OsaScan, AsyncOsaScan 
| Variable  | Value (Example) | Description | Type | Is Required* | Default |
| ------------- | ------------- | ------------- |------------- | ------------- | ------------- |
| cxServer | https://checkmarx.company.com | Checkmarx Server URL | String | Yes* | |
| cxUsername | admin@cx | Checkmarx Username | String | Yes* (if no token) | |
| cxPassword | ${{ secrets.CX_PASSWORD }} | Checkmarx Password | Secure String | Yes* (if no token) | |
| cxToken | ${{ secrets.CX_TOKEN }} | Checkmarx Token | Secure String | Yes* (if no credentials)| |
| cxTeam | \CxServer\SP\Company\TeamA | Checkmarx Team | String | Yes* | | 
| cxOsaLocationPath | folder | OSA Location Folder | String | Yes* | |
| cxOsaArchiveToExtract |  \*.zip | Comma separated list of file extensions to be extracted in the OSA scan. | String | No | |
| cxOsaFilesInclude | \*.dll,\*.jar | Comma separated list of file name patterns to include from the OSA scan.  | String | No | |
| cxOsaFilesExclude | \*.dll,\*.jar | Comma separated list of file name patterns to exclude from the OSA scan.  | String | No | |
| cxOsaPathExclude | \*/tests/\*  | Comma separated list of folder path patterns to exclude from the OSA scan.   | String | No | |
| cxOsaDepth | 2 | Extraction depth of files to include in the OSA scan. | Integer | No | -1 |
| cxOsaHigh | 0 | Threshold for High Severity Vulnerabilities | Integer | No | -1 |
| cxOsaMedium | 0 | Threshold for Medium Severity Vulnerabilities| Integer | No | -1 |
| cxOsaLow | 0 | Threshold for Low Severity Vulnerabilities| Integer | No | -1 |
| cxOsaReportHtml | reports/osa.html  | Generate CxOSA HTML report. | String | No | |
| cxOsaReportPDF | reports/osa.pdf  | Generate CxOSA PDF report. | String | No | |
| cxOsaJson | reports/osa.json  | Generate CxOSA JSON report. | String | No | |
| cxExecutePackageDependency | true | Retrieve all supported package dependencies before performing OSA scan | Boolean | No | false |
| cxCheckPolicy | true | This parameter will break the build if the CxOSA policy is violated. | Boolean | No | false |
| cxLog | log.log | Log File CLI output | String | No | | 
| cxVerbose | true | Checkmarx CLI log verbose level | Boolean | No | true |
| cxVersion | 8.9 | Checkmarx CLI version : 8.9, 8.8, 8.7, 8.6 | String | No | 8.9 |

#### Inputs for Actions: GenerateToken
| Variable  | Value (Example) | Description | Type | Is Required* | Default |
| ------------- | ------------- | ------------- |------------- | ------------- | ------------- |
| cxServer | https://checkmarx.company.com | Checkmarx Server URL | String | Yes* |
| cxUsername | admin@cx | Checkmarx Username | String | Yes* |
| cxPassword | ${{ secrets.CX_PASSWORD }} | Checkmarx Password | Secure String | Yes* |
| cxLog | log.log | Log File CLI output | String | No | | 
| cxVerbose | true | Checkmarx CLI log verbose level | Boolean | No | true |
| cxVersion | 8.9 | Checkmarx CLI version : 8.9, 8.8, 8.7, 8.6 | String | No | 8.9 |

#### Inputs for Actions: RevokeToken
| Variable  | Value (Example) | Description | Type | Is Required* | Default |
| ------------- | ------------- | ------------- |------------- | ------------- | ------------- |
| cxServer | https://checkmarx.company.com | Checkmarx Server URL | String | Yes* |
| cxToken | ${{ secrets.CX_TOKEN }} | Checkmarx Token | Secure String | Yes* (if no credentials)|
| cxLog | log.log | Log File CLI output | String | No | | 
| cxVerbose | true | Checkmarx CLI log verbose level | Boolean | No | true |
| cxVersion | 8.9 | Checkmarx CLI version : 8.9, 8.8, 8.7, 8.6 | String | No | 8.9 |


## Secrets

In order to securely configure this action, a password needs to be configured in Secrets section for later use in the YML template. 
Do the following steps:

- Go to your Repository
- Click on "Settings" Tab (requires you be the admin/owner of the repo)
- Click on "Secrets" section
- Add New Secret: 

| Secret | Value (Example) | Type | Is Required* |
| ------------- | ------------- |  ------------- | ------------- |
| CX_PASSWORD | ******** | Secure String | Yes* |

After setting this, you can access its value in YML template with the following format:

{{ secrets.VARIABLE_NAME }}

in this case:

{{ secrets.CX_PASSWORD }}

## Workflow - Sample SAST Scan

```yml
name: Checkmarx SAST Scan
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v1
    - name: Checkmarx Action
      uses: miguelfreitas93/checkmarx-github-action@master
      with:
        cxServer: https://checkmarx.company.com
        cxUsername: First.Last@company.com
        cxPassword: ${{ secrets.CX_PASSWORD }}
        cxTeam: \CxServer\SP\Company\TeamA
```

## Workflow - Sample OSA Scan

```yml
name: Checkmarx OSA Scan
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v1
    - name: Checkmarx Action
      uses: miguelfreitas93/checkmarx-github-action@master
      with:
        cxServer: https://checkmarx.company.com
        cxAction: OsaScan
        cxUsername: First.Last@company.com
        cxPassword: ${{ secrets.CX_PASSWORD }}
        cxTeam: \CxServer\SP\Company\TeamA
        cxOsaLocationPath: $GITHUB_WORKSPACE
```

## Workflow - Sample Revoke Token

```yml
name: Checkmarx Revoke Token
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v1
    - name: Checkmarx Action
      uses: miguelfreitas93/checkmarx-github-action@master
      with:
        cxServer: https://checkmarx.company.com
        cxAction: RevokeToken
        cxToken: ${{ secrets.CX_TOKEN }}
```

## Workflow - Sample Generate Token

```yml
name: Checkmarx Generate Token
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v1
    - name: Checkmarx Action
      uses: miguelfreitas93/checkmarx-github-action@master
      with:
        cxServer: https://checkmarx.company.com
        cxAction: GenerateToken
        cxUsername: First.Last@company.com
        cxPassword: ${{ secrets.CX_PASSWORD }}
```

### Notes:

- Make sure you do **Checkout** of the code, before Checkmarx Scan Step;
- Project name will be always the name of the Repository concatenated with branch scanned. For example: "TestRepository-master"

# License

MIT License

Copyright (c) 2020 Miguel Freitas