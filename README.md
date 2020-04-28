# Checkmarx Github Action ![Checkmarx](images/checkmarx.png) <img src="images/github.png" alt="Github" width="40" height="40">

[![Tests](https://github.com/miguelfreitas93/checkmarx-github-action/workflows/Checkmarx%20Github%20Action/badge.svg)](https://github.com/miguelfreitas93/checkmarx-github-action/actions)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL3.0-yellow.svg)](https://www.gnu.org/licenses)

Find security vulnerabilities in your Github Repository with Checkmarx using Github Action Integration.

![Checkmarx](images/checkmarx-big.png)

Checkmarx SAST (CxSAST) is an enterprise-grade flexible and accurate static analysis solution used to identify hundreds of security vulnerabilities in custom code. It is used by development, DevOps, and security teams to scan source code early in the SDLC, identify vulnerabilities and provide actionable insights to remediate them. Supporting over 22 coding and scripting languages and their frameworks with zero configuration to scan any language.

Please find more info in the official website: <a href="www.checkmarx.com">Checkmarx.com</a>


## Workflow - Sample SAST Scan with Username and Password Authentication

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
      uses: miguelfreitas93/checkmarx-github-action@<version>
      with:
        cxServer: https://checkmarx.company.com
        cxUsername: First.Last@company.com
        cxPassword: ${{ secrets.CX_PASSWORD }}
        cxTeam: \CxServer\SP\Company\TeamA
```

## Workflow - Sample SAST Scan with Token Authentication

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
      uses: miguelfreitas93/checkmarx-github-action@<version>
      with:
        cxServer: https://checkmarx.company.com
        cxToken: ${{ secrets.CX_TOKEN }}
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
      uses: miguelfreitas93/checkmarx-github-action@<version>
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
      uses: miguelfreitas93/checkmarx-github-action@<version>
      with:
        cxServer: https://checkmarx.company.com
        cxAction: RevokeToken
        cxToken: ${{ secrets.CX_TOKEN }}
```

## Workflow - Sample Generate Token (NOT RECOMMENDED TO USE FOR SECURITY REASONS)
```diff
- Security Note: Be aware this can leak Checkmarx Access Token in the build logs
```

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
      uses: miguelfreitas93/checkmarx-github-action@<version>
      with:
        cxServer: https://checkmarx.company.com
        cxAction: GenerateToken
        cxUsername: First.Last@company.com
        cxPassword: ${{ secrets.CX_PASSWORD }}
```


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
| cxTrustedCertificates | false | Trust Checkmarx Server URL Certificates (9.0 only)| Boolean | No | false |
| cxToken | ${{ secrets.CX_TOKEN }} | Checkmarx Token | Secure String | Yes* (if no credentials)|
| cxTeam | \CxServer\SP\Company\TeamA | Checkmarx Team | String | Yes* |
| cxPreset | Checkmarx Default | Checkmarx Project Preset | String | No | Checkmarx Default |
| cxConfiguration | Default Configuration | Project Configuration | String | No | Default Configuration |
| cxExcludeFolders | node_modules,test* | Exclude Folders (Default exclusions will be concatenated with this input) | String | No | cxcli,test,tests,mock,mocks,spec,unit,e2,androidTest,build,dist,deploy,venv,maven,gradle,target,example,examples,samples,docs,images,swagger,coverage,.idea,.temp,.tmp,.grunt,.github,.vscode,.nuget,.mvn,.m2,.DS_Store,.sass-cache,.gradle,\_\_pycache\_\_,.pytest_cache,.settings,res/color\*,res/drawable\*,res/mipmap\*,res/anim\*,\*imageset,xcuserdata,xcshareddata,\*xcassets,\*appiconset,\*xcodeproj,\*framework,\*lproj,__MACOSX,css,react,yui,node_modules,jquery\*,angular\*,bootstrap\*,modernizr\*,dojo,package,packages,vendor,xjs |
| cxExcludeFiles | *.spec.js, *.sql | Exclude Files (Default exclusions will be concatenated with this input)| String | No | \*.min.js,\*.spec,\*.spec.\*,\*Test.\*,Test\*,test\*,\*Mock\*,Mock\* |
| cxHigh | 0 | Threshold for High Severity Vulnerabilities | Integer | No | -1 |
| cxMedium | 0 | Threshold for Medium Severity Vulnerabilities| Integer | No | -1 |
| cxLow | 0 | Threshold for Low Severity Vulnerabilities| Integer | No | -1 |
| cxReportXML | reports/sast.xml  | Generate CxSAST XML report. | String | No | |
| cxReportPDF | reports/sast.pdf  | Generate CxSAST PDF report. | String | No | |
| cxReportRTF | reports/sast.rtf  | Generate CxSAST RTF report. | String | No | |
| cxReportCSV | reports/sast.csv  | Generate CxSAST CSV report. | String | No | |
| cxTrustedCertificates | false | Trust Checkmarx Server URL Certificates | Boolean | No | false |
| cxForceScan | false | Force Scan | Boolean | No | false |
| cxIncremental | false | Incremental Scan | Boolean | No | false |
| cxPrivate | false | Private Scan | Boolean | No | false |
| cxLog | log.log | Log File CLI output | String | No | | 
| cxComment | Test Scan Comment | Scan Comment | String | No | git branch@commitSHA |
| cxVerbose | true | Checkmarx CLI log verbose level | Boolean | No | true |
| cxVersion | 8.9 | Checkmarx CLI version : 9.0, 8.9, 8.8, 8.7, 8.6 | String | No | 8.9 |
| cxSkipIfFail | true | Don't fail step if something goes wrong | Boolean | No | false |

#### Inputs for Actions: OsaScan, AsyncOsaScan 
| Variable  | Value (Example) | Description | Type | Is Required* | Default |
| ------------- | ------------- | ------------- |------------- | ------------- | ------------- |
| cxServer | https://checkmarx.company.com | Checkmarx Server URL | String | Yes* | |
| cxUsername | admin@cx | Checkmarx Username | String | Yes* (if no token) | |
| cxPassword | ${{ secrets.CX_PASSWORD }} | Checkmarx Password | Secure String | Yes* (if no token) | |
| cxTrustedCertificates | false | Trust Checkmarx Server URL Certificates (9.0 only)| Boolean | No | false |
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
| cxVersion | 8.9 | Checkmarx CLI version : 9.0, 8.9, 8.8, 8.7, 8.6 | String | No | 8.9 |
| cxSkipIfFail | true | Don't fail step if something goes wrong | Boolean | No | false |

#### Inputs for Actions: GenerateToken
| Variable  | Value (Example) | Description | Type | Is Required* | Default |
| ------------- | ------------- | ------------- |------------- | ------------- | ------------- |
| cxServer | https://checkmarx.company.com | Checkmarx Server URL | String | Yes* |
| cxUsername | admin@cx | Checkmarx Username | String | Yes* |
| cxPassword | ${{ secrets.CX_PASSWORD }} | Checkmarx Password | Secure String | Yes* |
| cxTrustedCertificates | false | Trust Checkmarx Server URL Certificates (9.0 only)| Boolean | No | false |
| cxLog | log.log | Log File CLI output | String | No | | 
| cxVerbose | true | Checkmarx CLI log verbose level | Boolean | No | true |
| cxVersion | 8.9 | Checkmarx CLI version : 9.0, 8.9, 8.8, 8.7, 8.6 | String | No | 8.9 |
| cxSkipIfFail | true | Don't fail step if something goes wrong | Boolean | No | false |

#### Inputs for Actions: RevokeToken
| Variable  | Value (Example) | Description | Type | Is Required* | Default |
| ------------- | ------------- | ------------- |------------- | ------------- | ------------- |
| cxServer | https://checkmarx.company.com | Checkmarx Server URL | String | Yes* |
| cxToken | ${{ secrets.CX_TOKEN }} | Checkmarx Token | Secure String | Yes* (if no credentials)|
| cxTrustedCertificates | true | Trust Checkmarx Server URL Certificates (9.0 only)| Boolean | No | false |
| cxLog | log.log | Log File CLI output | String | No | | 
| cxVerbose | true | Checkmarx CLI log verbose level | Boolean | No | true |
| cxVersion | 8.9 | Checkmarx CLI version : 9.0, 8.9, 8.8, 8.7, 8.6 | String | No | 8.9 |
| cxSkipIfFail | true | Don't fail step if something goes wrong | Boolean | No | false |


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

# Notes:

- Make sure you do **Checkout** of the code, before Checkmarx Scan Step;
- Project name will be always the name of the Repository concatenated with branch scanned. For example: "TestRepository-master"
- A proper Checkmarx queue, engine management and sizing should be performed, in order to guarantee pipeline gets feedback from Checkmarx ASAP, so a build could be break or an application could be released faster
- If a build is break due to "cxHigh", "cxMedium", "cxLow" or "cxOsaHigh", "cxOSAMedium", "cxOSALow", is recommended to use Checkmarx Portal to revise results and mark them properly using "Confirmed" or "Not Exploitable" states. These thresholds only take into consideration results that are not marked as "Not Exploitable".

# Security:

```diff
- For example purposes, cxServer, cxUsername, cxTeam are presented in plaintext. Beside this, to assure confidentiality for production use, please place them under Secrets, as CX_PASSWORD and CX_TOKEN.

- Avoid to use cxAction: GenerateToken, since this can leak Checkmarx access token to the build logs.
```
# Challenges:

- If Checkmarx Server is not open to Internet, this action will not be able to reach the server and will fail.
- Network Rules/Firewalls/Proxies to access Checkmarx Server to block some sort of requests from outside based on IP, number of attempted connections, etc... 

# License

Checkmarx Github Action

Copyright (C) 2020 Miguel Freitas

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.