// TODO proper type for Vue Router routes when that package exports types (missing in rc.2)

type ViteSSROptions = { routes: any[] }

type Hook = (params: {
  app: any;
  router: any;
  request?: Request;
  baseUrl?: string;
  isClient: boolean;
  initialState?: Record<string, any>;
}) => Promise<void>;