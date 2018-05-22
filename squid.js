var Squid = function() {}

Squid.results = []

Squid.Predicate = function(compareFunc, messageFunc, subject, result) {
  this.subject = subject
  this.result = result
  this.compareFunc = compareFunc
  this.messageFunc = messageFunc

  this.compare = function(trueValue) {
    var success = this.compareFunc(this.subject, this.result) === trueValue
    var message = this.messageFunc(success, this.subject, this.result)
    return new Squid.Result(success, message)
  }
}

var eql = function(subject, result) {
  return new Squid.Predicate(
    function(subject, result) { return subject === result },
    function(success, subject, result) {
      var message
      if (success) { message = subject + " equals " + result }
      else { message = "Expected " + subject.join(',') + " to equal " + result.join(',') }
      return message
    },
    subject,
    result
  )
}

var include = function(subject, result) {
  return new Squid.Predicate(
    function(subject, result) {
      if (typeof subject === "string") {
        for (var i = 0; i < subject.length; i++)
          if (subject[i] === result) return true;
        return false
      }
      return subject.hasOwnProperty(result)
    },
    function(success, subject, result) {
      var message
      if (success) { message = subject + " includes " + result }
      else { message = "Expected " + subject + " to include " + result }
      return message
    },
    subject,
    result
  )
}

Squid.Expectation = function(subject) {
  this.subject = subject

  this.to = function(predicate, result) {
    return predicate(this.subject, result).compare(true)
  }

  this.toNot = function(predicate, result) {
    return predicate(this.subject, result).compare(false)
  }
}

Squid.expect = function(subject) {
  return new Squid.Expectation(subject)
}

Squid.Result = function(success, message) {
  this.success = success
  this.message = message

  this.log = function() {
    console.log(this.nameSpace)
    console.log("\t" + this.description)
    console.log("\t\t" + this.message)
    console.log("\n")
  }
}

Squid.Spec = function(description) {
  this.description = description

  this.it = function(description, code) {
    var result = code()
    result.nameSpace = this.description
    result.description = description
    Squid.results.push(result)

    if (!result.success) result.log()
    return this
  }
}

Squid.describe = function(description, code) {
  return new Squid.Spec(description, code)
}
