const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getStoreReviews(store) {
  return (store.reviews ?? []).map((review, index) => ({
    ...review,
    id: review.id ?? `${store.id}-${index}`,
    storeId: store.id,
  }));
}

export function getAllOwnerReviews(stores) {
  return stores.flatMap((store) => getStoreReviews(store).map((review) => ({
    ...review,
    storeId: store.id,
    storeName: store.name,
  })));
}

export function getStoreMetrics(store, reviews) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : Number(store.rating ?? 0);
  const uniqueCustomers = new Set(reviews.map((review) => review.user.trim().toLowerCase())).size;
  const latestMonthReviews = getLatestMonthReviews(reviews);

  return {
    averageRating,
    totalReviews: totalReviews || Number(store.totalReviews ?? 0),
    uniqueCustomers,
    latestMonthReviews,
  };
}

export function getRatingBreakdown(reviews) {
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));
}

export function buildMonthlyTrendData(reviews, monthCount = 6) {
  if (!reviews.length) {
    return Array.from({ length: monthCount }, (_, index) => ({
      month: MONTH_NAMES[index],
      count: 0,
      avg: 0,
    }));
  }

  const latestDate = reviews.reduce((latest, review) => {
    const current = new Date(review.date);
    return current > latest ? current : latest;
  }, new Date(reviews[0].date));

  const buckets = [];
  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(latestDate.getFullYear(), latestDate.getMonth() - offset, 1);
    const monthKey = getMonthKey(date);
    const bucketReviews = reviews.filter((review) => getMonthKey(new Date(review.date)) === monthKey);
    const average = bucketReviews.length
      ? bucketReviews.reduce((sum, review) => sum + review.rating, 0) / bucketReviews.length
      : 0;

    buckets.push({
      month: MONTH_NAMES[date.getMonth()],
      count: bucketReviews.length,
      avg: Number(average.toFixed(1)),
    });
  }

  return buckets;
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getLatestMonthReviews(reviews) {
  if (!reviews.length) return 0;

  const latestDate = reviews.reduce((latest, review) => {
    const current = new Date(review.date);
    return current > latest ? current : latest;
  }, new Date(reviews[0].date));

  const monthKey = getMonthKey(latestDate);
  return reviews.filter((review) => getMonthKey(new Date(review.date)) === monthKey).length;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function normalizeReview(review) {
  return {
    ...review,
    comment: review.comment ?? '',
  };
}