#!/bin/sh

set -e	# exit on first failed command
export CX_PROJECT_NAME=$(basename "$GITHUB_REPOSITORY")
export BRANCH=$(basename "$GITHUB_REF")
export CX_CMD=""

#echo "URL: $INPUT_CXSERVER"
#echo "Username: $INPUT_CXUSERNAME"
#echo "Password: **********"
#echo "Project: $CX_PROJECT_NAME"
#echo "Branch: $BRANCH"
#echo "Team: $INPUT_CXTEAM"
#echo "Preset: $INPUT_CXPRESET"
#echo "High: $INPUT_CXHIGH"
#echo "Medium: $INPUT_CXMEDIUM"
#echo "Low: $INPUT_CXLOW"
#echo "Comment: $INPUT_CXCOMMENT"
#echo "Incremental: $INPUT_CXISINCREMENTAL"

# Checkmarx Server URL
if [[ -z $INPUT_CXSERVER ]]; then
  echo "'cxServer' env var is empty. Please set it !"
  exit 1
else
  CX_CMD="${CX_CMD} -CxServer ${INPUT_CXSERVER}"
fi

# Checkmarx Username
if [[ -z $INPUT_CXUSERNAME ]]; then
  echo "'cxUsername' env var is empty. Please set it !"
  exit 1
else
  CX_CMD="${CX_CMD} -CxUser ${INPUT_CXUSERNAME}"
fi

# Checkmarx Password
if [[ -z $INPUT_CXPASSWORD ]]; then
  echo "'cxPassword' env var is empty. Please set it !"
  exit 1
else
  CX_CMD="${CX_CMD} -CxPassword ${INPUT_CXPASSWORD}"
fi

# Checkmarx Team Name
if [[ -z $INPUT_CXTEAM ]]; then
  echo "'cxTeam' env var is empty. Please set it !"
  exit 1
else
  CX_CMD="${CX_CMD} -ProjectName \"${INPUT_CXTEAM}\\${CX_PROJECT_NAME}-${BRANCH}\""
fi

# Checkmarx Preset Name
if [[ -z $CMD_PRESET ]]; then 
  CX_CMD="${CX_CMD}"
else 
  CX_CMD="${CX_CMD} -preset \"${INPUT_CXPRESET}\""
fi

# Location
CX_CMD="${CX_CMD} -LocationType folder"
CX_CMD="${CX_CMD} -LocationPath \"${GITHUB_WORKSPACE}\""

# High Severity Threshold
if [[ -z $INPUT_CXHIGH ]]; then
  CX_CMD="${CX_CMD}"
else 
  CX_CMD="${CX_CMD} -SASTHigh ${INPUT_CXHIGH}"
fi

# Medium Severity Threshold
if [[ -z $INPUT_CXMEDIUM ]]; then
  CX_CMD="${CX_CMD}"
else 
  CX_CMD="${CX_CMD} -SASTMedium ${INPUT_CXMEDIUM}"
fi

# Low Severity Threshold
if [[ -z $INPUT_CXLOW ]]; then
  CX_CMD="${CX_CMD}"
else 
  CX_CMD="${CX_CMD} -SASTLow ${INPUT_CXLOW}"
fi

#Scan Comment
if [[ -z $INPUT_CXCOMMENT ]]; then
  CX_CMD="${CX_CMD} -Comment \"git_${BRANCH}@${GITHUB_SHA}\""
else 
  CX_CMD="${CX_CMD} -Comment \"${INPUT_CXCOMMENT}\""
fi

# Verbose
CX_CMD="${CX_CMD} -v"

#wget -O ~/cxcli.zip https://download.checkmarx.com/8.9.0/Plugins/CxConsolePlugin-8.90.0.zip
#unzip ~/cxcli.zip -d ~/cxcli
#rm -rf ~/cxcli.zip
#chmod +x ~/cxcli/runCxConsole.sh
echo ~/cxcli/runCxConsole.sh Scan $CX_CMD
~/cxcli/runCxConsole.sh Scan $CX_CMD
#-ReportXML $GITHUB_WORKSPACE/results.xml \
#-ReportPDF $GITHUB_WORKSPACE/results.pdf \


