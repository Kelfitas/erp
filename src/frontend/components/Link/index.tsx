import React, { ReactElement } from 'react';
import MuiLink from '@material-ui/core/Link';
import { useHistory } from 'react-router-dom';

interface LinkProps {
  // React Router props
  to: string;
  // React props
  children: any;
  // MuiLink props
  color: "initial" | "inherit" | "primary" | "secondary" | "textPrimary" | "textSecondary" | "error" | undefined;
  underline: "none" | "hover" | "always" | undefined;
  variant: "inherit" | "button" | "caption" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2" | "overline" | "srOnly" | undefined;
  component: any;
  classes: object | undefined;
};

export default function Link(props: LinkProps): ReactElement {
  const history = useHistory();
  const { to, children, ...rest } = props;

  return (
    <MuiLink
      color="inherit"
      underline="none"
      onClick={() => history.push(to)}
      {...rest}
    >
      {children}
    </MuiLink>
  );
};

