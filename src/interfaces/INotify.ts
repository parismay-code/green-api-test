export enum NotifyTypes {
    error = 'error',
    success = 'success',
    warning = 'warning',
    info = 'info',
    hint = 'hint',
}

export default interface INotify {
    type: NotifyTypes,
    message: string,
    duration: number,
}
