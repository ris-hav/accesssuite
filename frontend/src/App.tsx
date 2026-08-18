import { Outlet, useNavigation } from 'react-router-dom';

// Lives at the router root, above every route -- this is what covers the gap
// a per-page "Loading..." text can't: the moment between clicking a link and
// the lazy-loaded route's JS chunk actually arriving, when there's no
// component mounted yet to show anything at all. useNavigation() reflects
// that same window (and any loader's async work) via its `state` field.
export function App() {
  const navigation = useNavigation();
  const navigating = navigation.state !== 'idle';

  return (
    <>
      {navigating && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-blue-100 z-50 overflow-hidden">
          <div className="h-full w-1/3 bg-blue-600 route-progress-bar" />
        </div>
      )}
      <Outlet />
    </>
  );
}
