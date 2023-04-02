# Scrum Showdown

_Remote estimations with (some) style!_

Scrum Showdown is a web application to help with estimations during home office times.

## Running

### Online 

The application can be accessed on [Heroku](https://scrumshowdown.herokuapp.com/).

### Local

1. Clone this repository
1. `pnpm install`
1. `pnpm start:dev`
1. Have fun!

## Usage

### As host

1. Open [Scrum Showdown](https://scrumshowdown.herokuapp.com/) in your browser
1. Input your name ( this is how others will see you )
1. Click 'Create'
1. Copy the current URL
1. Share the URL with your participants

### As client

1. If it's your first time using Scrum Showdown
    1. Open the [Scrum Showdown](https://scrumshowdown.herokuapp.com/) in your browser
    1. Setup your profile
    1. Click save
1. Open the Scrum Showdown link provided by your host

### Estimations

1. Select your value
1. Click the '❌' to set yourself to ready
1. Once everyone's ready, press '🃏' to request estimations
1. If not everyone is ready, the estimation is rejected
1. Otherwise, the results are broadcast to everyone

> NOTE: Estimation result history is stored as long as the room is alive. Rooms are removed once all the participants have left.

## Issues

In case you encounter anything unexpected or have some feedback about Scrum Showdown, please feel free to [submit an issue](https://github.com/elementbound/scrumshowdown/issues).

## License

See [LICENSE](LICENSE)
