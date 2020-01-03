#!/bin/sh

set -e	# exit on first failed command

if [[ -z $INPUT_CXSERVER ]]; then
  echo "'cxServer' env var is empty. Please set it !"
  exit 1
fi

if [[ -z $INPUT_CXUSERNAME ]]; then
  echo "'cxUsername' env var is empty. Please set it !"
  exit 1
fi

if [[ -z $INPUT_CXPASSWORD ]]; then
  echo "'cxPassword' env var is empty. Please set it !"
  exit 1
fi

if [[ -z $INPUT_CXTEAM ]]; then
  echo "'cxTeam' env var is empty. Please set it !"
  exit 1
fi

if [[ -z $INPUT_CXPRESET ]]; then
  INPUT_CXPRESET="Checkmarx Default"
fi

if [[ -z $INPUT_CXHIGH ]]; then
  INPUT_CXHIGH=999999
fi

if [[ -z $INPUT_CXMEDIUM ]]; then
  INPUT_CXMEDIUM=999999
fi

if [[ -z $INPUT_CXLOW ]]; then
  INPUT_CXLOW=999999
fi

export CX_PROJECT_NAME=$(basename "$GITHUB_REPOSITORY")
export BRANCH=$(basename "$GITHUB_REF")

if [[ -z $INPUT_CXCOMMENT ]]; then
  INPUT_CXCOMMENT="git ${BRANCH}@${GITHUB_SHA}"
fi

wget -O ~/cxcli.zip https://download.checkmarx.com/8.9.0/Plugins/CxConsolePlugin-8.90.0.zip
unzip ~/cxcli.zip -d ~/cxcli
rm -rf ~/cxcli.zip
chmod +x ~/cxcli/runCxConsole.sh

~/cxcli/runCxConsole.sh Scan -CxServer $INPUT_CXSERVER -CxUser $INPUT_CXUSERNAME -CxPassword $INPUT_CXPASSWORD -ProjectName "$INPUT_CXTEAM\\$CX_PROJECT_NAME-$BRANCH" -preset "$INPUT_CXPRESET" -LocationType folder -LocationPath $GITHUB_WORKSPACE -SASTHigh $INPUT_CXHIGH -SASTMedium $INPUT_CXMEDIUM -SASTLow $INPUT_CXLOW -ReportXML $GITHUB_WORKSPACE/results.xml -ReportPDF $GITHUB_WORKSPACE/results.pdf -Comment "${INPUT_CXCOMMENT}" -v