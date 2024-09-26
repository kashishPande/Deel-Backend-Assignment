const clientMapper = (client)=> {
    console.log('client ',client)
  
    const { id,  firstName, lastName, paid} = client;
    return {
      id: id,
      fullName: `${firstName || ""} ${lastName || ""}`,
      paid: parseFloat(paid).toFixed(2),
    };
  };

  module.exports = {
    clientMapper
  };