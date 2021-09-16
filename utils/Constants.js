import { Dimensions } from "react-native";

export default {
    DEVICE_WIDTH: Dimensions.get("window").width,
    DEVICE_HEIGHT: Dimensions.get("window").height,

    GRID_LARGE_WIDTH: Dimensions.get("window").width * 0.36,
    GRID_SMALL_WIDTH: Dimensions.get("window").width * 0.16,

    DRAWER_BUTTON_SIZE: Dimensions.get("window").width * 0.125,
    DRAWER_WIDTH: Dimensions.get("window").width * 0.775,
    SEARCH_WIDTH: Dimensions.get("window").width * 0.45,
    PICKER_WIDTH: Dimensions.get("window").width * 0.25,
}