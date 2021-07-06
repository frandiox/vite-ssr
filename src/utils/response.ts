export const isRedirect = ({ status = 0 } = {}) => status >= 300 && status < 400
