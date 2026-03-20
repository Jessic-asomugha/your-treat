export async function me(req, res) {
  // req.user is set by requireAuth middleware
  const user = req.user
  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role
  })
}