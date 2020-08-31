
const garageSchema =
	{
		type: 'object',
		properties:
			{
				requestType: { type: 'string', required: true},
				apiPath: { type: 'string', required: true },
				userData:
					{
						type: 'object', required: false,
						properties:
							{
								username: { type: 'string', required: false },
								password: { type: 'string', required: false },
								email:  { type: 'string', required: false },
								phoneNumber: { type: 'string', required: false },
								approved: { type: 'boolean', required: false }
							}
					},
				garageData:
					{
						type: 'object', required: false,
						properties:
							{
								percentToClose: { type: 'number', required: true },
							}
					},
				weatherData:
					{
						type: 'object', required: false,
						properties:
							{
								lat: 'string',
								lng: 'string'
							}
					}
			}
	}

module.exports = garageSchema;
