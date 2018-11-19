set -x;

GO_BASE_DIR=/opt/app-root;
cd $GO_BASE_DIR;
wget https://dl.google.com/go/go1.11.1.linux-amd64.tar.gz;
tar -zxvf go*.tar.gz;
export PATH=${PATH}:${GO_BASE_DIR}/go/bin;
go version;
if [[ $? -ne 0 ]]; then
	echo "Failed to setup Go!";
	exit 1;
fi
echo "Go setup successful.";

set +x;
