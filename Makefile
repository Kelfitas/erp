start-elect:
	printf '\033]2;%s\033\\' 'elect'
	./tag-pane.sh bottom "elect" yarn electron-wait
start-proxy:
	printf '\033]2;%s\033\\' 'proxy'
	./tag-pane.sh bottom "proxy" yarn watch-proxy
start-react:
	printf '\033]2;%s\033\\' 'react'
	./tag-pane.sh bottom "react" yarn start | cat

start:
	tmuxinator start

stop:
	tmuxinator stop all
