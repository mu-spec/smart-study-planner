import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";
import { logEvent } from "../services/eventLogService";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unexpected error" };
  }

  componentDidCatch(error) {
    // Keep a lightweight log for release builds.
    console.error("Screen crashed:", error);
    logEvent("screen_crash", { message: error?.message || "unknown" });
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.meta}>{this.state.message}</Text>
          <Pressable style={styles.btn} onPress={this.handleRetry}>
            <Text style={styles.btnText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  title: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center"
  },
  meta: {
    color: colors.muted,
    textAlign: "center",
    marginBottom: 14
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "700"
  }
});
