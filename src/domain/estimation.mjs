class Estimation {
  constructor (topic, estimates) {
    /**
     * @member {string} topic Voting topic
     */
    this.topic = topic

    /**
     * @member {Map<string, string>} estimates A <user id; estimate> mapping
     */
    this.estimates = estimates
  }
}

export default Estimation
