import { useForm } from "@tanstack/react-form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { NumberField, SelectField, SubmitButton, TextField } from "./index";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  count: z.number({ message: "Count is required" }).min(0, "Must be ≥ 0"),
  role: z.enum(["admin", "member"]),
});
type Values = z.infer<typeof schema>;

function Harness({ onValid }: { onValid: (v: Values) => void }) {
  const form = useForm({
    defaultValues: { name: "", count: 0, role: "member" } as Values,
    validators: { onChange: schema },
    onSubmit: ({ value }) => onValid(schema.parse(value)),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <TextField form={form} name="name" label="Name" />
      <NumberField form={form} name="count" label="Count" />
      <SelectField
        form={form}
        name="role"
        label="Role"
        options={[
          { value: "admin", label: "Admin" },
          { value: "member", label: "Member" },
        ]}
      />
      <SubmitButton form={form}>Save</SubmitButton>
    </form>
  );
}

describe("form system", () => {
  it("disables submit when an edit makes the form invalid, re-enables when valid", async () => {
    const user = userEvent.setup();
    render(<Harness onValid={vi.fn()} />);

    const save = screen.getByRole("button", { name: "Save" });
    const name = screen.getByLabelText("Name");

    await user.type(name, "Widget");
    await waitFor(() => expect(save).toBeEnabled());

    await user.clear(name); // now invalid (name required)
    await waitFor(() => expect(save).toBeDisabled());

    await user.type(name, "Gadget");
    await waitFor(() => expect(save).toBeEnabled());
  });

  it("submits parsed values (number stays a number)", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);

    await user.type(screen.getByLabelText("Name"), "Widget");
    const count = screen.getByLabelText("Count");
    await user.clear(count);
    await user.type(count, "42");

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid).toHaveBeenCalledWith({
      name: "Widget",
      count: 42,
      role: "member",
    });
  });

  it("shows the zod message under a field after it is touched", async () => {
    const user = userEvent.setup();
    render(<Harness onValid={vi.fn()} />);

    const name = screen.getByLabelText("Name");
    await user.type(name, "x");
    await user.clear(name);
    await user.tab(); // blur marks the field touched

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });
});
