#!/bin/sh

set -e	# exit on first failed command
wget -O ~/cxcli.zip https://download.checkmarx.com/8.9.0/Plugins/CxConsolePlugin-8.90.0.zip
unzip ~/cxcli.zip -d ~/cxcli
rm -rf ~/cxcli.zip
chmod +x ~/cxcli/runCxConsole.sh

export CX_PROJECT_NAME=$(basename "$GITHUB_REPOSITORY")
export BRANCH=$(basename "$GITHUB_REF")

~/cxcli/runCxConsole.sh Scan -CxServer $INPUT_CXSERVER -CxUser $INPUT_CXUSERNAME -CxPassword $INPUT_CXPASSWORD -ProjectName "$INPUT_CXTEAM\\$CX_PROJECT_NAME-$BRANCH" -preset "$INPUT_CXPRESET" -LocationType folder -LocationPath $GITHUB_WORKSPACE -SASTHigh $INPUT_CXHIGH -SASTMedium $INPUT_CXMEDIUM -SASTLow $INPUT_CXLOW -ReportXML $GITHUB_WORKSPACE/results.xml -ReportPDF $GITHUB_WORKSPACE/results.pdf -Comment "git $BRANCH@$GITHUB_SHA" -verbose