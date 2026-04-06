import styled from "styled-components";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/endpoints";

const Nav = styled.header`
  height: 56px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  flex-shrink: 0;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const LogoMark = styled.div`
  width: 28px;
  height: 28px;
  background: var(--accent);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: #0b0c0f;
  letter-spacing: -1px;
  flex-shrink: 0;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.1;

  span:first-child {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0.2px;
  }

  span:last-child {
    font-size: 0.62rem;
    color: var(--accent);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-weight: 500;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.button<{ $active?: boolean }>`
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-secondary)")};
  background: ${(p) => (p.$active ? "var(--accent-dim)" : "transparent")};
  transition: all var(--transition);

  &:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LiveBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--green);
  background: var(--green-dim);
  border: 1px solid rgba(14, 203, 129, 0.25);
  border-radius: 3px;
  padding: 0.15rem 0.45rem;
  text-transform: uppercase;

  @media (max-width: 600px) {
    display: none;
  }
`;

const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);

  @media (max-width: 600px) {
    display: none;
  }
`;

const Avatar = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #0b0c0f;
  flex-shrink: 0;
`;

const UserName = styled.span`
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const LogoutBtn = styled.button`
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-dim);
  }
`;

export default function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
    }
  };

  const initials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : "MB";

  return (
    <Nav>
      <Brand>
        <LogoMark>MB</LogoMark>
        <BrandText>
          <span>MultiBank</span>
          <span>TradeFi</span>
        </BrandText>
      </Brand>

      <NavLinks>
        <NavLink $active>Dashboard</NavLink>
        <NavLink>Markets</NavLink>
        <NavLink>Portfolio</NavLink>
      </NavLinks>

      <Right>
        <LiveBadge>● Live</LiveBadge>
        {user && (
          <UserChip>
            <Avatar>{initials}</Avatar>
            <UserName>{user.name}</UserName>
          </UserChip>
        )}
        <LogoutBtn onClick={handleLogout}>Sign out</LogoutBtn>
      </Right>
    </Nav>
  );
}
