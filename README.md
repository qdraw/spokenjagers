# Spokenjagers Game

## How run the server part of this game localy

1.	Install Node.js
	https://nodejs.org/

	or use apt-get/macports/homebrew
	sudo port install nodejs
	sudo port install npm

2.	Install mysql-server
	using apt-get/macports/homebrew

3.	Create a database and user with r/w rights
	mysql -u root -p
	Enter password:

	mysql > create database deb40577_game;
	mysql > show databases;
	mysql > create user deb40577_game;
	mysql > grant all on deb40577_game.* to 'deb40577_game'@'localhost' identified by 'PASSW!ORD';

4.	Setup ".env" file (or change env_rename to .env)

	a.	facebook_api_key
			You can find your App ID at:
			https://developers.facebook.com/apps/

	b.	facebook_api_secret
			You can find your App Secret at:
			https://developers.facebook.com/apps/

	c.	google_api_key
			You can find your Client ID at:
			https://console.developers.google.com/
	d.	google_api_secret
			You can find your Client secret at:
			https://console.developers.google.com/

	e. 	use_database is always true

	f.	Setup (mysql) username, (mysql) password and (mysql) database (name)


5.	Install dependencies using npm

	a.	Go to the current directory using the terminal or your MS-DOS Window.
		(cd /this/directory)

	b.	$	npm install

	c.	$	npm start

	d.	navigate to http://localhost:8080/

	e.	Let's play!




Check ./sources for the code snippits that i've used in this code
