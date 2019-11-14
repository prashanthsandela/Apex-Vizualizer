import argparse

parser = argparse.ArgumentParser(description='This script posts Apex metrics data to Apache Apex Visualization server')
parser.add_argument('--visual-server', required=True, dest='host_name', help='Apache Apex Visualiser server host url')
parser.add_argument('--freq', default=30, dest='freq', help='Frequency in number of seconds application metrics should be refreshed, Default: 30 seconds')
parser.add_argument('--apex-cli-path', required=True, dest='apex_cli_path', help='Apex cli path home path. This path should contain ./bin ./lib. Required.')



args = parser.parse_args()

print args.freq