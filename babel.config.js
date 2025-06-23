module.exports = {
	presets: ['module:metro-react-native-babel-preset'],
	plugins: [
		['@babel/plugin-transform-flow-strip-types'],
		[
			"@babel/plugin-proposal-decorators",
			{
				"legacy": true
			}
		],
		["@babel/plugin-transform-class-properties",
		{
			"loose": false
		}],
		["@babel/plugin-transform-private-methods", {
			"loose": false
		}],
		["@babel/plugin-transform-private-property-in-object", {
			"loose": false
		}]
	]
};