export const requestMentorSession = async ({ universityName, mentorName, mentorCourse, slot, email, name }) => {
  const signupApi = import.meta.env.VITE_SIGNUP_API_URL;
  if (!signupApi) {
    return {
      ok: true,
      fallback: true,
      message: 'Request saved locally. Configure VITE_SIGNUP_API_URL to enable confirmation emails.'
    };
  }

  const endpoint = signupApi.replace(/\/api\/signup\/?$/, '/api/mentor-request');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universityName, mentorName, mentorCourse, slot, email, name })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(data?.error || 'Failed to submit mentor request');
  }

  return data;
};
