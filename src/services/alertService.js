function createAlert(comparison) {
  if (!comparison) {
    return {
      hasAlert: false,
    };
  }

  if (
    comparison.lowestPriceDifference !== null &&
    comparison.lowestPriceDifference < 0
  ) {
    return {
      hasAlert: true,
      type: "lowest-price-decreased",
      title: "Lowest price decreased",
      previousPrice: comparison.previousLowestPrice,
      currentPrice: comparison.currentLowestPrice,
      difference: comparison.lowestPriceDifference,
    };
  }

  return {
    hasAlert: false,
  };
}

module.exports = {
  createAlert,
};
