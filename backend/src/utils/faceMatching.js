const FaceDescriptor = require('../models/FaceDescriptor');

// Compute Euclidean distance between two numeric arrays
const euclideanDistance = (a, b) => {
  if (!a || !b || a.length !== b.length) return Number.POSITIVE_INFINITY;
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

/**
 * Find the best matching user for a given descriptor.
 * @param {number[]} descriptor - Face descriptor from face-api.js (frontend).
 * @param {number} threshold - Maximum distance to consider a valid match.
 * @returns {Promise<{ userId: string, distance: number } | null>}
 */
const findBestMatch = async (descriptor, threshold = 0.6) => {
  const allDescriptors = await FaceDescriptor.find().lean();
  if (!allDescriptors.length) return null;

  let best = null;

  for (const d of allDescriptors) {
    const dist = euclideanDistance(descriptor, d.descriptor);
    if (Number.isNaN(dist)) continue;

    if (!best || dist < best.distance) {
      best = { userId: String(d.user), distance: dist };
    }
  }

  if (!best || best.distance > threshold) {
    return null;
  }

  return best;
};

/**
 * Find best match only among descriptors for a specific user (for self-attendance).
 * @param {string} userId - Mongoose user ObjectId string.
 * @param {number[]} descriptor - Face descriptor from frontend.
 * @param {number} threshold - Maximum distance to consider a valid match.
 * @returns {Promise<{ matched: boolean, distance?: number }>}
 */
const findBestMatchForUser = async (userId, descriptor, threshold = 0.6) => {
  const userDescriptors = await FaceDescriptor.find({ user: userId }).lean();
  if (!userDescriptors.length) {
    return { matched: false, reason: 'no_descriptors' };
  }

  let bestDistance = Infinity;

  for (const d of userDescriptors) {
    const dist = euclideanDistance(descriptor, d.descriptor);
    if (!Number.isNaN(dist) && dist < bestDistance) {
      bestDistance = dist;
    }
  }

  if (bestDistance > threshold) {
    return { matched: false, distance: bestDistance, reason: 'no_match' };
  }

  return { matched: true, distance: bestDistance };
};

module.exports = {
  euclideanDistance,
  findBestMatch,
  findBestMatchForUser
};

