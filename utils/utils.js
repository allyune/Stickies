exports.generateUniqueId = () => {
    var currentDate = new Date();
    var timestamp = currentDate.getTime();
    var randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return timestamp + "_" + randomString;
  }

exports.uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
