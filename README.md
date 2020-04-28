# Scrum Showdown

_Remote estimations with (some) style!_

Scrum Showdown is a web application to help with estimations during home office times.

## Running

### Online 

The application can be accessed on [Heroku](https://scrumshowdown.herokuapp.com/).

### Local

1. Clone this repository
1. `npm install`
1. `npm run start:dev`
1. Have fun!

## Usage

### As host

1. Open [Scrum Showdown](https://scrumshowdown.herokuapp.com/) in your browser
1. Input your name ( this is how others will see you )
1. Click 'Create'
1. Click on 'Room' to copy the room ID
1. Share the room ID with your participants

### As first-time client

1. Open [Scrum Showdown](https://scrumshowdown.herokuapp.com/) in your browser
1. Input your name ( this is how others will see you )
1. Input the room ID you've received from your host
1. Click 'Join'

### Estimations

1. Select your value
1. Click the '❌' to set yourself to ready
1. Once everyone's ready, press '🃏' to request estimations
1. If not everyone is ready, the estimation is rejected
1. Otherwise, the results are broadcast to everyone

> NOTE: Estimation result history is stored as long as the room is alive. Rooms are removed once all the participants have left.

## License

See [LICENSE](LICENSE)