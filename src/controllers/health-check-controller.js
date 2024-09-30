export const healthCheckController = (req, res) => {
  res.status(200).send({
    status: 'ok',
  })
}
