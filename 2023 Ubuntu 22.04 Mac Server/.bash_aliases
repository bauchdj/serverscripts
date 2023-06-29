# https://help.ubuntu.com/community/Mount/USB and https://askubuntu.com/questions/1308084/upstart-to-automount-usb-in-ubuntu-server-20-04/
mntExfat() { sudo mount -t exfat $1 /mnt/$2 -o uid=1000,gid=1000,utf8,dmask=027,fmask=137; }

filterProcess() { ps -axjf | grep $1 | grep -v grep; }

ports() { sudo lsof -i -P | grep LISTEN; }

certbot_8090() { sudo certbot certonly --standalone --http-01-port 8090; }

serverStatus() { sudo systemctl status https-proxy.service jellyfin.service video-conference.service filesharing.service; }

findExclude() { sudo find $1 -not \( -path $2 -prune \) -iname "$3"; }
